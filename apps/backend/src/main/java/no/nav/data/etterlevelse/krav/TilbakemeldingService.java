package no.nav.data.etterlevelse.krav;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.DomainService;
import no.nav.data.etterlevelse.krav.domain.KravRepo;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding.Melding;
import no.nav.data.etterlevelse.krav.dto.CreateTilbakemeldingRequest;
import no.nav.data.etterlevelse.krav.dto.TilbakemeldingNewMeldingRequest;
import no.nav.data.etterlevelse.varsel.UrlGenerator;
import no.nav.data.etterlevelse.varsel.domain.Varsel;
import no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.slack.SlackClient;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static no.nav.data.etterlevelse.varsel.domain.Varsel.Paragraph.VarselUrl.url;

@Slf4j
@Service
public class TilbakemeldingService extends DomainService<Tilbakemelding> {

    private final TeamcatResourceClient resourceClient;
    private final EmailService emailService;
    private final SlackClient slackClient;
    private final UrlGenerator urlGenerator;

    public TilbakemeldingService(StorageService storage, KravRepo kravRepo,
            TeamcatResourceClient resourceClient, EmailService emailService, SlackClient slackClient, UrlGenerator urlGenerator) {
        super(storage, kravRepo, Tilbakemelding.class);
        this.urlGenerator = urlGenerator;
        this.resourceClient = resourceClient;
        this.emailService = emailService;
        this.slackClient = slackClient;
    }

    @Transactional
    public Tilbakemelding create(CreateTilbakemeldingRequest request) {
        Validator.validate(request)
                .addValidations(this::validateKravNummer)
                .ifErrorsThrowValidationException();

        var tilbakemelding = Tilbakemelding.create(request);
        var melding = tilbakemelding.getLastMelding();
        varsle(tilbakemelding, melding);

        log.info("New tilbakemelding {} på {} fra {}", tilbakemelding.getId(), tilbakemelding.kravId(), tilbakemelding.getMelder().getIdent());
        return storage.save(tilbakemelding);
    }

    @Transactional
    public Tilbakemelding newMelding(TilbakemeldingNewMeldingRequest request) {
        request.validate();

        var tilbakemelding = storage.get(request.getTilbakemeldingId(), Tilbakemelding.class);
        var melding = tilbakemelding.newMelding(request);
        varsle(tilbakemelding, melding);

        log.info("New melding nr {} på tilbakemelding {} på {} fra {}",
                melding.getMeldingNr(), tilbakemelding.getId(), tilbakemelding.kravId(), tilbakemelding.getMelder().getIdent());
        return storage.save(tilbakemelding);
    }

    private void varsle(Tilbakemelding tilbakemelding, Melding melding) {
        var krav = kravRepo.findByKravNummer(tilbakemelding.getKravNummer(), tilbakemelding.getKravVersjon()).orElseThrow().toKrav();
        var sender = resourceClient.getResource(melding.getFraIdent()).orElseThrow();
        var recipients = tilbakemelding.getRecipientsForMelding(krav, melding);

        String kravId = krav.kravId();

        var builder = Varsel.builder();

        if (melding.getMeldingNr() == 1) {
            builder.title("Ny tilbakemelding på krav %s".formatted(kravId));
        } else {
            builder.title("Ny melding på tilbakemelding på krav %s".formatted(kravId));
        }

        var varsel = builder
                .paragraph(new Paragraph("%s har lagt igjen en tilbakemelding på Krav %%s"
                        .formatted(sender.getFullName()), url(urlGenerator.kravUrl(krav), kravId)))
                .build();

        // TODO consider schedule slack messages async (like email) to guard against slack downtime
        for (Varslingsadresse recipient : recipients) {
            switch (recipient.getType()) {
                case EPOST -> emailService.scheduleMail(MailTask.builder().to(recipient.getAdresse()).subject(varsel.getTitle()).body(varsel.toHtml()).build());
                case SLACK -> slackClient.sendMessageToChannel(recipient.getAdresse(), varsel.toSlack());
                case SLACK_USER -> slackClient.sendMessageToUserId(recipient.getAdresse(), varsel.toSlack());
                default -> throw new NotImplementedException("%s is not an implemented varsel type".formatted(recipient.getType()));
            }
        }
    }
}
