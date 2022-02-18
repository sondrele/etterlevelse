package no.nav.data.etterlevelse.melding.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MeldingRepo extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where type = 'Melding' and data ->> 'meldingType' = ?1", nativeQuery = true)
    List<GenericStorage> findByMeldingtype(MeldingType meldingType);

    @Query(value = "select * from generic_storage where type = 'Melding' and data ->> 'meldingStatus' = ?1", nativeQuery = true)
    List<GenericStorage> findByMeldingStatus(MeldingStatus meldingStatus);
}
