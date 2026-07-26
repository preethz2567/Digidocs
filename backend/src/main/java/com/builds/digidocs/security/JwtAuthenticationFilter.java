package com.builds.digidocs.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
     public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    
    @Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
        throws ServletException, IOException {

    System.out.println("URI = " + request.getRequestURI());

    String header = request.getHeader("Authorization");
    System.out.println("HEADER = " + header);

    if (header != null && header.startsWith("Bearer ")) {

        String token = header.substring(7);

        try {

            String email = jwtService.extractEmail(token);
            System.out.println("EMAIL = " + email);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            AuthorityUtils.NO_AUTHORITIES
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("AUTHENTICATION SET");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    filterChain.doFilter(request, response);

    
}


}