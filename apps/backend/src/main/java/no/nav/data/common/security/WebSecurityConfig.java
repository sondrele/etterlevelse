package no.nav.data.common.security;

import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.web.UserFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableMethodSecurity(jsr250Enabled = true)
public class WebSecurityConfig {

    private final UserFilter userFilter = new UserFilter();

    private final AADStatelessAuthenticationFilter aadAuthFilter;
    private final SecurityProperties securityProperties;

    public WebSecurityConfig(AADStatelessAuthenticationFilter aadAuthFilter, SecurityProperties securityProperties) {
        this.aadAuthFilter = aadAuthFilter;
        this.securityProperties = securityProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(httpSecuritySessionManagementConfigurer -> httpSecuritySessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        addFilters(http);


        //Heirarchy structure. Top-down priority
        if (securityProperties == null || !securityProperties.isEnabled()) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        } else {
            allowAll(http,
                    "/error",
                    "/login",
                    "/oauth2/callback",
                    "/userinfo",
                    "/internal/**",
                    "/swagger*/**",

                    // Graphql
                    "/playground*/**",
                    "/voyager*/**",
                    "/vendor/voyager/**",
                    "/vendor/playground/**",
                    "/graphql*/**"
            );

            allowGetAndOptions(http,
                    "/settings/**",
                    "/codelist/**",

                    "/krav/**",
                    "/kravprioritering/**",
                    "/etterlevelse/**",
                    "/etterlevelsedokumentasjon/**",
                    "/behandling/**",
                    "/tilbakemelding/**",
                    "/etterlevelsemetadata/**",
                    "/melding/**",
                    "/export/**",
                    "/statistikk/**",
                    "/team/**",
                    "/begrep/**",
                    "/etterlevelsearkiv/**",
                    "/virkemiddel/**"
            );

            adminOnly(http,
                    "/audit/**",
                    "/settings/**",
                    "/codelist/**",
                    "/export/codelist/**",
                    "/etterlevelse/update/behandlingid/**",
                    "/etterlevelsearkiv/status/arkivert",
                    "/etterlevelsearkiv/admin/update",
                    "/etterlevelsedokumentasjon/admin/update/title/team"
            );

            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/krav/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));

            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/tilbakemelding/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/tilbakemelding/status/**")).hasAnyRole(AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/export/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.ADMIN.name(), AppRole.KRAVEIER.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/kravprioritering/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/etterlevelse/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/etterlevelsedokumentasjon/**")).hasAnyRole(AppRole.WRITE.name(), AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/etterlevelsemetadata/**")).hasAnyRole(AppRole.ADMIN.name(), AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/behandling/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name(), AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/melding/**")).hasAnyRole(AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/etterlevelsearkiv/**")).hasAnyRole(AppRole.WRITE.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/etterlevelse/update/behandlingid/**")).hasAnyRole(AppRole.ADMIN.name()));
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/virkemiddel/**")).hasAnyRole(AppRole.KRAVEIER.name(), AppRole.ADMIN.name()));

            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/logout")).authenticated());

            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher("/**")).permitAll());
            http.authorizeHttpRequests(auth -> auth.anyRequest().hasRole(AppRole.WRITE.name()));
        }
        return http.build();
    }

    private void adminOnly(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher(path)).hasRole(AppRole.ADMIN.name()));
        }
    }

    private void allowAll(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(new AntPathRequestMatcher(path)).permitAll());
        }
    }

    private void allowGetAndOptions(HttpSecurity http, String... paths) throws Exception {
        for (String path : paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.GET, path).permitAll());
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.OPTIONS, path).permitAll());
        }
    }

    private void allowPost(HttpSecurity http, String... paths) throws Exception {
        for (String path: paths) {
            http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.POST, path).permitAll());
        }
    }

    private void addFilters(HttpSecurity http) {
        // In lightweight mvc tests where authfilter isnt initialized
        if (aadAuthFilter != null) {
            http.addFilterBefore(aadAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }
        http.addFilterAfter(userFilter, UsernamePasswordAuthenticationFilter.class);
    }

}
