package com.kancelaria.officesystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getServletPath().contains("/office/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Достаем заголовок Authorization
        String authHeader = request.getHeader("Authorization");

        // 2. Если заголовка нет или он не Bearer — пропускаем дальше (Spring сам заблокирует позже)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Вырезаем сам токен (убираем слово "Bearer ")
        String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(jwt);

        // 4. Если email извлекся и пользователь еще не авторизован в системе
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Проверяем токен и достаем роли
            if (jwtService.isTokenValid(jwt)) {
                var authorities = jwtService.extractAuthorities(jwt);

                // Создаем "пропуск" для Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail, null, authorities
                );

                // Кладем пропуск в контекст — теперь Spring знает, кто делает запрос
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}