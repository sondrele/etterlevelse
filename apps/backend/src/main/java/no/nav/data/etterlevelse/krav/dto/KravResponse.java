package no.nav.data.etterlevelse.krav.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.domain.Krav.KravStatus;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "navn", "beskrivelse", "hensikt"})
public class KravResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private Integer kravNummer;
    private Integer kravVersjon;
    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private List<String> dokumentasjon;
    private List<String> implementasjoner;
    private List<String> begreper;
    private List<String> kontaktPersoner;
    private List<String> rettskilder;
    private List<String> tagger;
    private Periode periode;

    private CodelistResponse avdeling;
    private CodelistResponse underavdeling;

    private CodelistResponse relevansFor;
    private KravStatus status;

}
