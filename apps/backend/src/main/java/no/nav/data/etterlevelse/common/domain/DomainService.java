package no.nav.data.etterlevelse.common.domain;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.dto.KravRequest.Fields;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@RequiredArgsConstructor
public class DomainService<T extends DomainObject> {

    protected final StorageService storage;
    protected final KravRepo kravRepo;
    protected final Class<T> type;

    public T get(UUID uuid) {
        return storage.get(uuid, type);
    }

    public Page<T> getAll(Pageable pageable) {
        return storage.getAll(type, pageable);
    }

    protected <R extends KravId & Validated> void validateKravNummer(Validator<R> validator) {
        Integer kravNummer = validator.getItem().getKravNummer();
        Integer kravVersjon = validator.getItem().getKravVersjon();
        if (kravNummer != null && kravVersjon != null) {
            var krav = kravRepo.findByKravNummer(kravNummer, kravVersjon);
            if (krav.isEmpty()) {
                validator.addError(Fields.kravNummer, Validator.DOES_NOT_EXIST, "KravNummer %d KravVersjon %d does not exist".formatted(kravNummer, kravVersjon));
            }
        }
    }

}
