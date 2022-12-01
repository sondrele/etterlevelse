package no.nav.data.etterlevelse.etterlevelse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseRequest;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Etterlevelse implements DomainObject, KravId {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private String behandlingId;
    private Integer kravNummer;
    private Integer kravVersjon;

    private boolean etterleves;
    private String statusBegrunnelse;
    private List<String> dokumentasjon;
    private LocalDate fristForFerdigstillelse;
    private EtterlevelseStatus status;
    private List<SuksesskriterieBegrunnelse> suksesskriterieBegrunnelser;

    public Etterlevelse convert(EtterlevelseRequest request) {
        behandlingId = request.getBehandlingId();
        kravNummer = request.getKravNummer();
        kravVersjon = request.getKravVersjon();

        etterleves = request.isEtterleves();
        statusBegrunnelse = request.getStatusBegrunnelse();
        dokumentasjon = copyOf(request.getDokumentasjon());
        fristForFerdigstillelse = request.getFristForFerdigstillelse();
        status = request.getStatus();
        suksesskriterieBegrunnelser = StreamUtils.convert(request.getSuksesskriterieBegrunnelser(), SuksesskriterieBegrunnelse::convert);
        return this;
    }

    public EtterlevelseResponse toResponse() {
        return EtterlevelseResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)

                .behandlingId(behandlingId)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)

                .etterleves(etterleves)
                .statusBegrunnelse(statusBegrunnelse)
                .dokumentasjon(copyOf(dokumentasjon))
                .fristForFerdigstillelse(fristForFerdigstillelse)
                .status(status)
                .suksesskriterieBegrunnelser(StreamUtils.convert(suksesskriterieBegrunnelser,
                        SuksesskriterieBegrunnelse::toResponse))
                .build();
    }


    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        Etterlevelse other = (Etterlevelse) obj;
        return Objects.equals(kravNummer, other.kravNummer) && Objects.equals(kravVersjon, other.kravVersjon) && Objects.equals(behandlingId, other.behandlingId);
    }
    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + kravId());
    }
}
