package no.nav.data.etterlevelse.arkivering.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EtterlevelseArkivRepo extends JpaRepository<GenericStorage, UUID> {
    @Override
    @Query(value = "select * from generic_storage where type = 'EtterlevelseArkiv'",
            countQuery = "select count(1) from generic_storage where type = 'EtterlevelseArkiv'",
            nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Query(value = "select * from generic_storage where data -> 'webSakNummer' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByWebsakNummer(String nummer);

    @Query(value = "select * from generic_storage where data -> 'status' = to_jsonb(?1) and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByStatus(String status);

    @Query(value = "select * from generic_storage where data ->> 'behandlingId' = ?1 and type = 'EtterlevelseArkiv'", nativeQuery = true)
    List<GenericStorage> findByBehandling(String behandlingId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "update generic_storage set DATA = jsonb_set(DATA, '{status}', to_jsonb(?2) , false ) where data -> 'status' = to_jsonb(?1) and type = 'EtterlevelseArkiv' returning *", nativeQuery = true)
    List<GenericStorage> updateStatus(String oldStatus, String newStatus);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "update generic_storage set DATA = jsonb_set(DATA, '{status}', to_jsonb(?1) , false ) where data ->> 'behandlingId' = ?2 and type = 'EtterlevelseArkiv' returning *", nativeQuery = true)
    List<GenericStorage> updateStatusWithBehandlingsId(String newStatus, String behandlingsId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "update generic_storage set DATA = jsonb_set(DATA, '{arkiveringDato}', to_jsonb(?2) , false ) where data -> 'status' = to_jsonb(?1) and type = 'EtterlevelseArkiv' returning *", nativeQuery = true)
    List<GenericStorage> updateArkiveringDato(String status, LocalDateTime arkiveringDato);
}
