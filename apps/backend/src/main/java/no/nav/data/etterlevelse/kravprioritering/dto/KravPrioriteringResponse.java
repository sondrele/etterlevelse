package no.nav.data.etterlevelse.kravprioritering.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "kravNummer", "kravVersjon", "prioriteringsId"})
public class KravPrioriteringResponse {
    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;
    private Integer kravNummer;
    private Integer kravVersjon;
    private String prioriteringsId;
}
