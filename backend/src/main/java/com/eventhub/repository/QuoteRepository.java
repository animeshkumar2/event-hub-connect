package com.eventhub.repository;

import com.eventhub.model.Quote;
import com.eventhub.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {
    List<Quote> findByLead(Lead lead);
    List<Quote> findByLeadId(UUID leadId);
    Quote findByLeadAndIsAcceptedTrue(Lead lead);
}


