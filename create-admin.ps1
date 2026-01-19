# PowerShell script para criar usuário admin no Supabase
# Execute no PowerShell

$url = "https://nnbvmbjqlmuwlovlqgzh.supabase.co/auth/v1/admin/users"
$apiKey = "sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl"

$body = @{
    email = "admin@betsniper.com"
    password = "BetSniper2024!@#"
    email_confirm = $true
    user_metadata = @{
        role = "admin"
        name = "Administrador BetSniper"
    }
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "apikey" = $apiKey
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
