package no.nav.data.etterlevelse.arkivering.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EtterlevelseArkivRepo extends JpaRepository<GenericStorage, UUID> {
    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseArkiv' group by data -> 'webSakNummer'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseArkiv'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'webSakNummer' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByWebsakNummer(String nummer);

    @Query(value = "select * from generic_storage where data -> 'tilArkivering' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByTilArkivering(boolean tilArkivering);

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' = ?1 and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByBehandling(String behandlingId);

}
