package no.nav.data.etterlevelse.documentRelation;

import no.nav.data.IntegrationTestBase;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationResponse;
import no.nav.data.etterlevelse.krav.KravController;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class etterlevelseDocumentationControllerTest extends IntegrationTestBase {

    @BeforeEach
    void setup(){
        dokumentRelasjonRepository.deleteAll();
    }
    @Test
    void createDocumentRelation() {
        var req = getDocumentRelationRequest();

        var resp = restTemplate.postForEntity("/documentrelation", req, DocumentRelationResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        DocumentRelationResponse documentRelationResponse = resp.getBody();
        assertThat(documentRelationResponse).isNotNull();

        assertThat(documentRelationResponse.getToDocument()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isNotNull();
        assertThat(documentRelationResponse.getRelationType()).isNotNull();
        assertThat(documentRelationResponse.getId()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isEqualTo("fromId");
        assertThat(documentRelationResponse.getToDocument()).isEqualTo("toId");
    }

    @Test
    void createDuplicateDocumentRelation_shouldFail() {
        var req1 = getDocumentRelationRequest();
        var req2 = getDocumentRelationRequest();

        restTemplate.postForEntity("/documentrelation", req1, DocumentRelationResponse.class);
        var resp = restTemplate.postForEntity("/documentrelation", req2, DocumentRelationResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

    }

    @Test
    void updateDocumentRelation() {
        var req = getDocumentRelationRequest();

        var resp = restTemplate.postForEntity("/documentrelation", req, DocumentRelationResponse.class);

        var updateRequest = DocumentRelationRequest.builder()
                .id(resp.getBody().getId().toString())
                .toDocument("newDocument")
                .fromDocument("fromOldDocument")
                .relationType(RelationType.BYGGER)
                .build();

        var updateResp = restTemplate.exchange("/documentrelation/{id}", HttpMethod.PUT, new HttpEntity<>(updateRequest), DocumentRelationResponse.class, resp.getBody().getId());
        Assertions.assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DocumentRelationResponse documentRelationResponse = updateResp.getBody();

        assertThat(documentRelationResponse).isNotNull();

        assertThat(documentRelationResponse.getToDocument()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isNotNull();
        assertThat(documentRelationResponse.getRelationType()).isNotNull();
        assertThat(documentRelationResponse.getId()).isNotNull();
        assertThat(documentRelationResponse.getFromDocument()).isEqualTo("fromOldDocument");
        assertThat(documentRelationResponse.getToDocument()).isEqualTo("newDocument");
    }

    @Test
    void getAllDocumentRelations() {
        documentRelationService.save(DocumentRelationRequest
                .builder()
                .update(false)
                .fromDocument("oldFromDocument")
                .toDocument("toOldDocument")
                .relationType(RelationType.BYGGER)
                .build());

        documentRelationService.save(DocumentRelationRequest
                .builder()
                .update(false)
                .fromDocument("newFromDocument")
                .toDocument("toNewDocument")
                .relationType(RelationType.ARVER)
                .build());


        var resp = restTemplate.getForEntity("/documentrelation?pageSize=1", DocumentRelationController.DocumentRelationPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DocumentRelationController.DocumentRelationPage documentRelationPage = resp.getBody();
        Assertions.assertThat(documentRelationPage).isNotNull();
        Assertions.assertThat(documentRelationPage.getNumberOfElements()).isOne();
        Assertions.assertThat(documentRelationPage.getTotalElements()).isEqualTo(2L);

        resp = restTemplate.getForEntity("/documentrelation?pageSize=2&pageNumber=1", DocumentRelationController.DocumentRelationPage.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        documentRelationPage = resp.getBody();
        Assertions.assertThat(documentRelationPage).isNotNull();
        Assertions.assertThat(documentRelationPage.getNumberOfElements()).isZero();

    }

    private DocumentRelationRequest getDocumentRelationRequest() {
        return DocumentRelationRequest.builder()
                .toDocument("toId")
                .fromDocument("fromId")
                .relationType(RelationType.ARVER)
                .build();
    }

}
