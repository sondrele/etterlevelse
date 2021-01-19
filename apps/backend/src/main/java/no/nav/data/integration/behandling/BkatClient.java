package no.nav.data.integration.behandling;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.integration.behandling.dto.BkatProcess;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static no.nav.data.common.utils.StreamUtils.toMap;

@Slf4j
@Service
public class BkatClient {

    private final WebClient client;
    private final LoadingCache<String, List<BkatProcess>> processSearchCache;
    private final LoadingCache<String, BkatProcess> processCache;
    private final Cache<String, ProcessPage> processPageCache;
    private final LoadingCache<String, List<BkatProcess>> processTeamCache;

    public BkatClient(WebClient.Builder webClientBuilder, BkatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.processSearchCache = MetricUtils.register("bkatProcessSearchCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::search));
        this.processCache = MetricUtils.register("bkatProcessCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(300).build(this::getProcess0));
        this.processPageCache = MetricUtils.register("bkatProcessPageCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(20).build());
        this.processTeamCache = MetricUtils.register("bkatProcessTeamCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcessesForTeam));
    }

    public BkatProcess getProcess(String id) {
        return processCache.get(id);
    }

    public Map<String, BkatProcess> getProcessesById(Collection<String> ids) {
        return processCache.getAll(ids, this::getProcesses0);
    }

    public List<BkatProcess> findProcesses(String search) {
        return processSearchCache.get(search);
    }

    public List<BkatProcess> getProcessesForTeam(String teamId) {
        return processTeamCache.get(teamId);
    }

    public RestResponsePage<BkatProcess> findByPage(int pageNumber, int pageSize) {
        return processPageCache.get("%d-%d".formatted(pageNumber, pageSize), key -> findByPage0(pageNumber, pageSize));
    }

    public ProcessPage findByPage0(int pageNumber, int pageSize) {
        return get("/process?pageNumber={pageNumber}&pageSize={pageSize}", ProcessPage.class, pageNumber, pageSize);
    }

    private BkatProcess getProcess0(String id) {
        return get("/process/{id}", BkatProcess.class, id);
    }

    private Map<String, BkatProcess> getProcesses0(Iterable<? extends String> uncachedIds) {
        Map<String, BkatProcess> map = toMap(post("/process/shortbyid", uncachedIds, ProcessPage.class).getContent(), BkatProcess::getId);
        log.info("fetched {} processes from bkat", map.size());
        return map;
    }

    private List<BkatProcess> search(String search) {
        return get("/process/search/{search}", ProcessPage.class, search).getContent();
    }

    private List<BkatProcess> findProcessesForTeam(String teamId) {
        return get("/process?productTeam={teamId}", ProcessPage.class, teamId).getContent();
    }

    private <T> T get(String uri, Class<T> response, Object... params) {
        var res = client.get()
                .uri(uri, params)
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private <T> T post(String uri, Object body, Class<T> response) {
        var res = client.post()
                .uri(uri)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(response)
                .block();
        Assert.isTrue(res != null, "response is null");

        return res;
    }

    private static class ProcessPage extends RestResponsePage<BkatProcess> {

    }

}
