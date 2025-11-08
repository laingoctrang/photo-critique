package com.photo_critique_be.config.security.user;

import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> account = userRepository.findByEmail(username);
        return account.map(CustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User %s not found", username)));
    }

    public UserDetails loadUserById(String id) throws UsernameNotFoundException {
        Optional<User> account = userRepository.findById(id);
        return account.map(CustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User with id %s not found", id)));
    }
}
