module.exports = {
        date(timestamp) {
            // Transformando em Objeto de Data
            const date = new Date(timestamp);
            
            // Ano
            const year = date.getUTCFullYear();

            // Mês
            let month = String(date.getUTCMonth() + 1);
            
            if (month.length == 1) {
                month = '0'+month;
            };

            // Dia
            let day = String(date.getUTCDate());
            
            if (day.length == 1) {
                day = '0'+day;
            };

            // Horas
            const hour = date.getHours();

            // Minutos
            const minutes = date.getMinutes();

            // return yyyy-mm-dd
            return {
                day,
                month,
                year,
                hour,
                minutes,
                iso: `${year}-${month.slice(-2)}-${day.slice(-2)}`,
                birthDay: `${day.slice(-2)}/${month.slice(-2)}`,
                format: `${day.slice(-2)}/${month.slice(-2)}/${year}`,
            }
        },

        formatPrice(value) {
            value = value.toString().replace(/\D/g, '');

            return value = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value/100);
        },

        formatCpfCnpj(value) {
            value = value.replace(/\D/g, '');
    
            if (value.length > 14) {
                value = value.slice(0, -1);
            };
            
            // CHECK IF IS CPF OR CNPJ
    
            if (value.length > 11) {
                // CNPJ
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
    
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
    
                value = value.replace(/(\d{3})(\d)/, '$1/$2');
                
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
    
            } else {
                // CPF
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
    
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
    
                value = value.replace(/(\d{3})(\d)/, '$1-$2');
    
            };
    
            return value;
        },
    
        formatCep(value) {
            value = value.replace(/\D/g, '');
    
            if (value.length > 8) {
                value = value.slice(0, -1);
            };
    
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
    
            return value;
        },
};