package no.nav.data.etterlevelse.arkivering.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivRequest;
import no.nav.data.etterlevelse.arkivering.dto.EtterlevelseArkivResponse;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkiv implements DomainObject {
    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;
    private String etterlevelseDokumentasjonId;
    private String behandlingId;
    private EtterlevelseArkivStatus status;
    private LocalDateTime arkiveringDato;
    private String arkivertAv;
    private LocalDateTime tilArkiveringDato;
    private LocalDateTime arkiveringAvbruttDato;
    private String webSakNummer;


    public EtterlevelseArkiv convert(EtterlevelseArkivRequest request) {
        behandlingId = request.getBehandlingId();
        etterlevelseDokumentasjonId = request.getEtterlevelseDokumentasjonId();
        arkiveringDato = request.getArkiveringDato();
        arkivertAv = request.getArkivertAv();
        tilArkiveringDato = request.getTilArkiveringDato();
        arkiveringAvbruttDato = request.getArkiveringAvbruttDato();
        webSakNummer = request.getWebSakNummer();
        status = request.getStatus();

        return this;
    }

    public EtterlevelseArkivResponse toResponse() {
        return EtterlevelseArkivResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .behandlingId(behandlingId)
                .etterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
                .arkiveringDato(arkiveringDato)
                .arkivertAv(arkivertAv)
                .tilArkiveringDato(tilArkiveringDato)
                .arkiveringAvbruttDato(arkiveringAvbruttDato)
                .webSakNummer(webSakNummer)
                .status(status.name())
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), behandlingId + "-" + webSakNummer);
    }
}
