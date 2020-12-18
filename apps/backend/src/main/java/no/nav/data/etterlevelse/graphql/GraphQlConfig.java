package no.nav.data.etterlevelse.graphql;

import graphql.scalars.ExtendedScalars;
import graphql.schema.GraphQLScalarType;
import no.nav.data.common.utils.MdcExecutor;
import no.nav.data.etterlevelse.graphql.support.LocalDateTimeScalar;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.Executor;

@Configuration
public class GraphQlConfig {

    @Bean
    public GraphQLScalarType date() {
        return ExtendedScalars.Date;
    }

    @Bean
    public GraphQLScalarType dateTime() {
        return new LocalDateTimeScalar();
    }

    @Bean
    public Executor graphQLExecutor() {
        return MdcExecutor.newThreadPool(10, "graphqlex");
    }

}
