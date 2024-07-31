package no.nav.data.etterlevelse.util;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.Profile;

@Aspect
@Profile("test | local | dev")
@Slf4j
public class LogExecutionTimeAdvice {

    @Around("execution(public * *..*Repo*.*(..))")
    public Object logExecTimeAdvice(ProceedingJoinPoint point) throws Throwable {
        Throwable thrown = null;
        Object result = null;
        long execTime = System.currentTimeMillis();
        try {
            result = point.proceed();
        } catch (Throwable t) {
            thrown = t;
        }
        execTime = System.currentTimeMillis() - execTime;
        log.info("Execution time for {}: {}", point.getSignature().toString(), execTime);
        if (thrown != null) {
            throw thrown;
        } else {
            return result;
        }
    }

}
