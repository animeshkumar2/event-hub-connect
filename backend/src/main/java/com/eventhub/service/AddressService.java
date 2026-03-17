package com.eventhub.service;

import com.eventhub.model.CustomerAddress;
import com.eventhub.repository.CustomerAddressRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final CustomerAddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<CustomerAddress> getAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    public CustomerAddress createAddress(UUID userId, CustomerAddress address) {
        address.setUserId(userId);

        // If this is the first address or marked as default, handle default logic
        if (address.getIsDefault() == null || address.getIsDefault()) {
            long count = addressRepository.countByUserId(userId);
            if (count == 0) {
                address.setIsDefault(true);
            } else if (Boolean.TRUE.equals(address.getIsDefault())) {
                addressRepository.clearDefaultForUser(userId);
            }
        }

        return addressRepository.save(address);
    }

    public CustomerAddress updateAddress(UUID userId, UUID addressId, CustomerAddress updated) {
        CustomerAddress existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        if (!existing.getUserId().equals(userId)) {
            throw new NotFoundException("Address not found");
        }

        existing.setLabel(updated.getLabel());
        existing.setFullAddress(updated.getFullAddress());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPincode(updated.getPincode());

        if (Boolean.TRUE.equals(updated.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
            existing.setIsDefault(true);
        }

        return addressRepository.save(existing);
    }

    public void deleteAddress(UUID userId, UUID addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new NotFoundException("Address not found");
        }

        addressRepository.delete(address);

        // If deleted address was the default, make the first remaining one default
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<CustomerAddress> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                CustomerAddress first = remaining.get(0);
                first.setIsDefault(true);
                addressRepository.save(first);
            }
        }
    }

    public CustomerAddress setDefault(UUID userId, UUID addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new NotFoundException("Address not found");
        }

        addressRepository.clearDefaultForUser(userId);
        address.setIsDefault(true);
        return addressRepository.save(address);
    }
}
