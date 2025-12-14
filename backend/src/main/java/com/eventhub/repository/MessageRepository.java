package com.eventhub.repository;

import com.eventhub.model.Message;
import com.eventhub.model.ChatThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByThreadOrderByCreatedAtDesc(ChatThread thread, Pageable pageable);
    List<Message> findByThreadOrderByCreatedAtAsc(ChatThread thread);
    Long countByThreadAndIsReadFalse(ChatThread thread);
}




