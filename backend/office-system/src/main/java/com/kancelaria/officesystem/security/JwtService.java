package com.kancelaria.officesystem.security;

import com.kancelaria.officesystem.model.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct; // Важно для инициализации
//Когда Spring создает объект JwtService, поле secret сначала пустое.
//Если мы попытаемся создать key прямо в объявлении поля,
//мы получим ошибку или пустой ключ.
//Аннотация @PostConstruct говорит:
// «Сначала подставь все значения из настроек,
// а потом выполни этот метод, чтобы подготовить ключ к работе»
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    // Этот метод выполнится СРАЗУ после того, как Spring создаст сервис
    // и подставит значение секретной строки из свойств
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getUserId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Извлекаем роли и превращаем их в формат, понятный Spring Security
    public Collection<SimpleGrantedAuthority> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        String role = (String) claims.get("role"); // Достаем роль, которую мы клали при генерации
        return List.of(new SimpleGrantedAuthority(role));
    }

    // Вспомогательные методы для работы с Claims
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key) // Тот самый ключ из @PostConstruct
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

}