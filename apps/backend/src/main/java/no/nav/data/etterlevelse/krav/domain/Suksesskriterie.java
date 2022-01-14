package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Value;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieRequest;
import no.nav.data.etterlevelse.krav.dto.SuksesskriterieResponse;

import javax.ws.rs.DefaultValue;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Suksesskriterie {

    private int id;
    private String navn;
    private String beskrivelse;
    @Builder.Default
    private boolean behovForBegrunnelse = true;


    public static Suksesskriterie convert(SuksesskriterieRequest request) {
        return Suksesskriterie.builder()
                .id(request.getId())
                .navn(request.getNavn())
                .beskrivelse(request.getBeskrivelse())
                .behovForBegrunnelse(request.isBehovForBegrunnelse())
                .build();
    }

    public SuksesskriterieResponse toResponse() {
        return SuksesskriterieResponse.builder()
                .id(id)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .behovForBegrunnelse(behovForBegrunnelse)
                .build();
    }

}
