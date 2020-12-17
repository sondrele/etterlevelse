package no.nav.data.etterlevelse.krav;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.SneakyThrows;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.etterlevelse.behandling.dto.Behandling;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.graphql.GraphQLTestBase;
import no.nav.data.integration.behandling.BkatMocks;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static no.nav.data.graphql.GraphQLAssert.assertThat;


class KravGraphQLIT extends GraphQLTestBase {

    private final Behandling behandling = BkatMocks.processMockResponse().convertToBehandling();
    private final ObjectMapper om = JsonUtils.getObjectMapper();

    @Test
    @SneakyThrows
    void getKrav() {
        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .build());
        storageService.save(Etterlevelse.builder()
                .kravNummer(krav.getKravNummer()).kravVersjon(krav.getKravVersjon())
                .behandlingId(behandling.getId())
                .build());

        var var = Map.of("nummer", krav.getKravNummer().toString(), "versjon", krav.getKravVersjon().toString());
        var response = graphQLTestTemplate.perform("graphqltest/krav_get.graphql", vars(var));

        assertThat(response, "kravForNummer")
                .hasNoErrors()
                .hasField("navn", "Krav 1")
                .hasField("etterlevelser[0].behandlingId", behandling.getId())
                .hasField("etterlevelser[0].behandling.navn", behandling.getNavn());
    }

    @Test
    @SneakyThrows
    void kravFilter() {
        var krav = storageService.save(Krav.builder()
                .navn("Krav 1").kravNummer(50).kravVersjon(1)
                .relevansFor(List.of("SAK"))
                .build());
        storageService.save(Krav.builder()
                .navn("Krav 2").kravNummer(51).kravVersjon(1)
                .relevansFor(List.of("INNSYN"))
                .build());

        var var = Map.of("relevans", "SAK");
        var response = graphQLTestTemplate.perform("graphqltest/krav_filter.graphql", vars(var));

        assertThat(response, "kravFor")
                .hasNoErrors()
                .hasSize(1)
                .hasField("[0].id", krav.getId().toString());
    }

    private ObjectNode vars(Map<String, String> map) {
        var on = om.createObjectNode();
        map.entrySet().forEach(e -> on.put(e.getKey(), e.getValue()));
        return on;
    }
}
