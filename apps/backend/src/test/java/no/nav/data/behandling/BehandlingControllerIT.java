package no.nav.data.behandling;

import no.nav.data.IntegrationTestBase;
import no.nav.data.behandling.BehandlingController.BehandlingPage;
import no.nav.data.behandling.dto.Behandling;
import no.nav.data.etterlevelse.common.domain.ExternalCode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class BehandlingControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getProcess() {
        ResponseEntity<Behandling> behandling = restTemplate
                .getForEntity("/behandling/{Id}", Behandling.class, "74288ec1-c45d-4b9f-b799-33539981a690");
        assertThat(behandling.getBody()).isNotNull();
        assertThat(behandling.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertResponseProcess(behandling.getBody());
    }

    @Test
    void searchProcesses() {
        ResponseEntity<BehandlingPage> behandlinger = restTemplate
                .getForEntity("/behandling/search/{search}", BehandlingPage.class, "name");
        assertThat(behandlinger.getBody()).isNotNull();
        assertThat(behandlinger.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(behandlinger.getBody().getContent()).hasSize(1);
        assertResponseProcess(behandlinger.getBody().getContent().get(0));
    }

    private void assertResponseProcess(Behandling behandling) {
        assertThat(behandling).isEqualTo(Behandling.builder()
                .id("74288ec1-c45d-4b9f-b799-33539981a690")
                .navn("process name")
                .nummer(101)
                .formaal("formaal")
                .overordnetFormaal(ExternalCode.builder().list("FORMAAL").code("FOR").shortName("For").description("desc").external(true).build())
                .avdeling(ExternalCode.builder().list("AVDELING").code("AVD").shortName("Avd").description("desc").external(true).build())
                .linje(ExternalCode.builder().list("LINJE").code("LIN").shortName("Lin").description("desc").external(true).build())
                .system(ExternalCode.builder().list("SYSTEM").code("SYS").shortName("Sys").description("desc").external(true).build())
                .team("team")
                .build());
    }
}