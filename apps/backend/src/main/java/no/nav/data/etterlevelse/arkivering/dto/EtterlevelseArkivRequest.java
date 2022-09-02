package no.nav.data.etterlevelse.arkivering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkivStatus;

import java.time.LocalDateTime;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseArkivRequest implements RequestElement {
    private String id;
    private String behandlingId;
    private EtterlevelseArkivStatus status;
    private LocalDateTime arkiveringDato;
    private String webSakNummer;
    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setBehandlingId(trimToNull(behandlingId));
        if (status == null) {
            status = EtterlevelseArkivStatus.TIL_ARKIVERING;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id,id);
        validator.checkId(this);
        validator.checkBlank(Fields.behandlingId,behandlingId);

    }
}
