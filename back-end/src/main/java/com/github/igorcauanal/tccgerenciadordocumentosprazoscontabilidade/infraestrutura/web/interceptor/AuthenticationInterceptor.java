package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.interceptor;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.AuthenticateController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

public class AuthenticationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Permite pré-flight CORS e rotas públicas.
        if ("OPTIONS".equalsIgnoreCase(method) || isPublicPath(path, method)) {
            return true;
        }

        HttpSession session = request.getSession(false);
        Object authenticatedUser = session != null
                ? session.getAttribute(AuthenticateController.AUTHENTICATED_USER_SESSION_ATTRIBUTE)
                : null;

        if (authenticatedUser == null) {
            // Bloqueia acesso a rotas internas quando não houver usuário autenticado.
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

        return true;
    }

    private boolean isPublicPath(String path, String method) {
        if (path == null) {
            return false;
        }

        // Login e rotas públicas de autenticação/links de clientes.
        if (path.startsWith("/auth/") || path.startsWith("/public/") || "/error".equals(path)) {
            return true;
        }

        // Upload de item da solicitação pode ser realizado pelo cliente via link enviado.
        if ("POST".equalsIgnoreCase(method) && path.matches("^/requests/\\d+/items/\\d+/upload$")) {
            return true;
        }

        return false;
    }
}
