package no.nav.data.etterlevelse.graphql.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto.EtterlevelseDokumentasjonResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Controller
public class EtterlevelseGraphQlController {
    private final EtterlevelseService etterlevelseService;
    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;

    @QueryMapping
    public EtterlevelseResponse etterlevelseById(@Argument UUID id) {
        log.info("etterlevelse {}", id);
        return etterlevelseService.get(id).toResponse();
    }

    @SchemaMapping(typeName = "Etterlevelse", field = "etterlevelseDokumentasjon")
    public EtterlevelseDokumentasjonResponse etterlevelseDokumentasjon(EtterlevelseResponse etterlevelse) {
        if (etterlevelse.getEtterlevelseDokumentasjonId() != null) {
            return etterlevelseDokumentasjonService.get(UUID.fromString(etterlevelse.getEtterlevelseDokumentasjonId())).toResponse();
        } else {
            return EtterlevelseDokumentasjonResponse.builder().build();
        }
    }
}
