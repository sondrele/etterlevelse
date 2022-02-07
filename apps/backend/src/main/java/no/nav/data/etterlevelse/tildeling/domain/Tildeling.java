package no.nav.data.etterlevelse.tildeling.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.tildeling.dto.TildelingRequest;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tildeling implements DomainObject, KravId {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer kravVersion;
    private Integer kravNummer;
    private String behandlingId;
    private List<String> tildeltMed;

    public Tildeling convert(TildelingRequest request) {
        kravNummer = request.getKravNummer();
        kravVersion = request.getKravVersjon();
        behandlingId = request.getBehandlingId();
        return this;
    }
}
