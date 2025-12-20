package com.photo_critique_be.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.Map;

public class FilterUtil {
    
    public static Pageable buildPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }
        return PageRequest.of(page != null ? page : 0, size != null ? size : 20, sort);
    }

    public static Criteria buildSearchCriteria(String searchTerm, String... searchFields) {
        if (searchTerm == null || searchTerm.trim().isEmpty() || searchFields.length == 0) {
            return new Criteria();
        }
        
        Criteria[] criteriaArray = new Criteria[searchFields.length];
        for (int i = 0; i < searchFields.length; i++) {
            criteriaArray[i] = Criteria.where(searchFields[i]).regex(searchTerm, "i");
        }
        return new Criteria().orOperator(criteriaArray);
    }

    public static Criteria buildFilterCriteria(Map<String, String> filters) {
        Criteria criteria = new Criteria();
        if (filters == null || filters.isEmpty()) {
            return criteria;
        }

        for (Map.Entry<String, String> entry : filters.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                criteria.and(key).is(value);
            }
        }
        return criteria;
    }

    public static Criteria combineCriteria(Criteria searchCriteria, Criteria filterCriteria) {
        boolean hasSearch = searchCriteria.getCriteriaObject().size() > 0;
        boolean hasFilter = filterCriteria.getCriteriaObject().size() > 0;
        
        if (hasSearch && hasFilter) {
            return new Criteria().andOperator(searchCriteria, filterCriteria);
        } else if (hasSearch) {
            return searchCriteria;
        } else if (hasFilter) {
            return filterCriteria;
        }
        return new Criteria();
    }
}

