# 🔒 Rotación de Credenciales - Acción Inmediata Requerida

## ⚠️ IMPORTANTE: El archivo .env fue expuesto en el repositorio Git

**Todas las credenciales deben ser rotadas INMEDIATAMENTE** para prevenir acceso no autorizado.

---

## 1. Supabase - Rotar Anon Key

### Pasos:

1. **Acceder al Dashboard de Supabase:**
   - URL: https://supabase.com/dashboard/project/qkdvosjitrkopnarbozv/settings/api

2. **Regenerar API Keys:**
   - Ve a Settings > API
   - En la sección "Project API keys", haz clic en el icono de refresh
   - **⚠️ IMPORTANTE:** Esto invalidará la clave anterior inmediatamente
   - Copia la nueva `anon` key

3. **Actualizar en el proyecto:**
   ```bash
   # Editar tu archivo .env local (NO lo subas a git)
   EXPO_PUBLIC_SUPABASE_ANON_KEY=nueva_clave_anon_aqui
   ```

4. **Actualizar en Vercel (si está desplegado):**
   ```bash
   vercel env rm EXPO_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production
   # Pegar la nueva clave cuando se solicite
   ```

### Impacto de no rotar:
- ❌ Acceso no autorizado a la base de datos
- ❌ Posible lectura de datos de usuarios
- ❌ Posible modificación de datos según RLS policies

---

## 2. Stripe - Verificar y Rotar Publishable Key

### Pasos:

1. **Acceder al Dashboard de Stripe:**
   - URL: https://dashboard.stripe.com/test/apikeys

2. **Verificar si la clave está en modo test:**
   - Si comienza con `pk_test_`, es clave de prueba (menos crítico)
   - Si comienza con `pk_live_`, es clave de producción (**CRÍTICO**)

3. **Para claves de producción (`pk_live_`):**
   - Ve a Developers > API keys
   - Haz clic en "Roll key" en la publishable key
   - Actualiza en tu .env local y Vercel

4. **Para claves de test (`pk_test_`):**
   - Menos urgente, pero recomendado rotar
   - Mismo proceso que arriba

### ⚠️ Clave expuesta:
```
pk_test_51QUCGRJZVOC64zeiRG6WajqkGB7zUfWL3qI10o2yY9sLXIStSFnRK2yw84dYKsn4g6ouOCpqKrr4lcMi4rsORWQR00U7wvFeYP
```

**Tipo:** Test key (menos crítico pero debe rotarse)

---

## 3. N8N Webhook - Cambiar URL o Agregar Autenticación

### Pasos:

1. **Opción A - Rotar URL del Webhook:**
   - Accede a tu instancia de N8N: https://services.enerbook.mx
   - Edita el workflow que expone el webhook
   - Genera una nueva URL con un token único:
     ```
     https://services.enerbook.mx/webhook/nueva-ruta-secreta-uuid
     ```
   - Actualiza en .env:
     ```bash
     EXPO_PUBLIC_N8N_WEBHOOK_URL=https://services.enerbook.mx/webhook/nueva-ruta-secreta-uuid
     ```

2. **Opción B - Agregar Autenticación (Recomendado):**
   - Configura autenticación en N8N:
     - Header Authentication
     - Basic Auth
     - API Key
   - Actualiza el código para enviar headers de autenticación:
     ```javascript
     fetch(webhookUrl, {
       headers: {
         'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
       }
     })
     ```

### URL expuesta:
```
https://services.enerbook.mx/webhook
```

**Impacto:** Posible spam de requests o abuso del servicio de OCR

---

## 4. Verificar Otros Servicios

### GitHub:
- Si este repositorio es público, **considera hacerlo privado**
- Revisa el historial de commits para ver si hay más credenciales expuestas:
  ```bash
  git log --all --full-history --source --pretty=format:"%H" -- .env | xargs git show
  ```

### Vercel:
- Verifica que las variables de entorno estén configuradas correctamente
- No uses las credenciales expuestas

---

## 5. Monitoreo Post-Rotación

### Supabase:
1. Ve a Dashboard > Logs
2. Revisa accesos sospechosos en las últimas 48 horas
3. Verifica queries inusuales

### Stripe:
1. Ve a Payments > All payments
2. Busca transacciones no autorizadas
3. Revisa el log de eventos

### Base de datos:
1. Ejecuta esta query para ver accesos recientes a `cotizaciones_leads_temp`:
   ```sql
   SELECT created_at, temp_lead_id, recibo_cfe->>'nombre' as nombre
   FROM cotizaciones_leads_temp
   WHERE created_at > NOW() - INTERVAL '48 hours'
   ORDER BY created_at DESC;
   ```

---

## 6. Checklist de Seguridad Post-Rotación

- [ ] ✅ .env removido del repositorio git
- [ ] ✅ .gitignore actualizado para prevenir futuras exposiciones
- [ ] ✅ .env.example creado (sin credenciales reales)
- [ ] ⏳ Supabase Anon Key rotada
- [ ] ⏳ Stripe Publishable Key verificada/rotada
- [ ] ⏳ N8N Webhook URL cambiada o autenticada
- [ ] ⏳ Variables de entorno actualizadas en Vercel/producción
- [ ] ⏳ Logs revisados para detectar accesos sospechosos
- [ ] ⏳ Tests ejecutados para verificar que todo funciona con nuevas credenciales

---

## 7. Prevención Futura

### Git Hooks:
Instalar pre-commit hook para detectar credenciales:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npx secretlint --config .secretlintrc.json"
```

### Usar Supabase Vault:
Para secretos del lado del servidor, usa Supabase Vault:
```sql
SELECT vault.create_secret('mi_secreto_valor', 'mi_secreto_nombre');
```

### Alertas de Seguridad:
- Habilita GitHub Secret Scanning (si es repo privado con GitHub Advanced Security)
- Configura alertas en Supabase para accesos inusuales

---

## 📞 Contacto de Emergencia

Si detectas acceso no autorizado:
1. **Supabase:** support@supabase.com
2. **Stripe:** https://support.stripe.com/
3. **Tu equipo de DevOps/Seguridad**

---

**Fecha de este documento:** 2025-10-02
**Última actualización de credenciales:** [PENDIENTE - Actualizar después de rotar]
