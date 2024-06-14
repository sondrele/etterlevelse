package no.nav.data.etterlevelse.documentRelation;

import lombok.RequiredArgsConstructor;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelation;
import no.nav.data.etterlevelse.documentRelation.domain.DocumentRelationRepository;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;
import no.nav.data.etterlevelse.documentRelation.dto.DocumentRelationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentRelationService {

    private final DocumentRelationRepository repository;


    public DocumentRelation getById(UUID id){
        return repository.getReferenceById(id);
    }

    public Page<DocumentRelation> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<DocumentRelation> findByFromDocument(String fromDocumentId) {
        return repository.findByFromDocument(fromDocumentId);
    }

    public List<DocumentRelation> findByToDocument(String toDocumentId) {
        return repository.findByToDocument(toDocumentId);
    }


    public List<DocumentRelation> findByFromDocumentAndRelationType (String fromDocumentId, RelationType relationType){
        return repository.findByFromDocumentAndRelationType(fromDocumentId, relationType);
    };

    public List<DocumentRelation> findByToDocumentAndRelationType(String toDocumentId, RelationType relationType){
        return repository.findByToDocumentAndRelationType(toDocumentId, relationType);
    };

    public DocumentRelation findByFromDocumentAndToDocumentAndRelationType(String fromDocumentId, String toDocumentId, RelationType relationType) {
        return repository.findByFromDocumentAndToDocumentAndRelationType(fromDocumentId, toDocumentId, relationType);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation save(DocumentRelationRequest request) {
        DocumentRelation documentRelation = request.isUpdate() ? repository.getReferenceById(request.getIdAsUUID()) : new DocumentRelation();
        documentRelation.merge(request);

        return repository.save(documentRelation);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public DocumentRelation deleteById(UUID id){
        DocumentRelation documentRelation = getById(id);
        repository.deleteById(id);
        return documentRelation;
    }
}
