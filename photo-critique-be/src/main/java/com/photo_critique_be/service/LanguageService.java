package com.photo_critique_be.service;

import com.photo_critique_be.enums.MessageCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LanguageService {
    private final MessageSource messageSource;

    public String getMessage(MessageCode messageCode) {
        return messageSource.getMessage(messageCode.getCode(), null, LocaleContextHolder.getLocale());
    }

    public String getMessage(MessageCode messageCode, Object... args) {
        return messageSource.getMessage(messageCode.getCode(), args, LocaleContextHolder.getLocale());
    }
}