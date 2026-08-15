package com.builds.digidocs.mapper;

import com.builds.digidocs.dto.TagDto;
import com.builds.digidocs.entity.Tag;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {
    
    public TagDto toDto(Tag tag) {
        if (tag == null) {
            return null;
        }
        return new TagDto(tag.getId(), tag.getName(), tag.getColor());
    }
}
