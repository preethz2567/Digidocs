package com.builds.digidocs.controller;

import com.builds.digidocs.dto.TagDto;
import com.builds.digidocs.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(tagService.getAllTags(email));
    }

    @PostMapping
    public ResponseEntity<TagDto> createTag(@AuthenticationPrincipal String email, @RequestBody TagDto tagDto) {
        return ResponseEntity.ok(tagService.createTag(email, tagDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id, @AuthenticationPrincipal String email) {
        tagService.deleteTag(id, email);
        return ResponseEntity.noContent().build();
    }
}
