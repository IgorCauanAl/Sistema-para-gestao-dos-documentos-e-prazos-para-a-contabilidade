package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util;

/**
 * Normaliza CNPJ para o padrão brasileiro: 00.000.000/0000-00.
 *
 * <p>Aceita entrada com ou sem pontuação e é idempotente. A validação permanece
 * a mesma de antes (14 dígitos); este utilitário apenas padroniza a escrita.</p>
 */
public final class CnpjFormatter {

    public static final int DIGITS_LENGTH = 14;

    private CnpjFormatter() {
    }

    public static String format(String cnpj) {
        if (cnpj == null) {
            throw new IllegalArgumentException("CNPJ é obrigatório");
        }

        String digits = cnpj.replaceAll("\\D", "");
        if (digits.length() != DIGITS_LENGTH) {
            throw new IllegalArgumentException("CNPJ deve conter 14 dígitos");
        }

        return digits.substring(0, 2) + "." +
                digits.substring(2, 5) + "." +
                digits.substring(5, 8) + "/" +
                digits.substring(8, 12) + "-" +
                digits.substring(12, 14);
    }

    public static String digits(String cnpj) {
        if (cnpj == null) {
            throw new IllegalArgumentException("CNPJ é obrigatório");
        }
        return cnpj.replaceAll("\\D", "");
    }
}
