package no.nav.data.common.storage.domain;

import no.nav.data.common.validator.RequestElement;
import no.nav.data.etterlevelse.krav.domain.Krav;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class TypeRegistration {

    private static final Map<Class<?>, String> classToType = new HashMap<>();
    private static final Map<String, Class<?>> typeToClass = new HashMap<>();
    private static final Set<String> auditedTypes = new HashSet<>();

    static {
        addDomainClass(Krav.class, true);
    }

    private TypeRegistration() {
    }

    private static void addDomainClass(Class<? extends DomainObject> aClass, boolean audited) {
        String typeName = aClass.getSimpleName();
        classToType.put(aClass, typeName);
        typeToClass.put(typeName, aClass);
        if (audited) {
            auditedTypes.add(typeName);
        }
    }

    public static boolean isAudited(String type) {
        return auditedTypes.contains(type);
    }

    public static String typeOf(Class<?> clazz) {
        return classToType.get(clazz);
    }

    public static String typeOfRequest(RequestElement request) {
        return request.getRequestType();
    }

    @SuppressWarnings("unchecked")
    public static <T> Class<T> classFrom(String type) {
        Class<?> aClass = typeToClass.get(type);
        return (Class<T>) aClass;
    }
}
