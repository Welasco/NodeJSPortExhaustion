$JSON = @'
{
    "Host": "www.google.com",
    "Port": 80,
    "Connections": 5
}
'@
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/Socket/Start" -Method Post -Body $JSON -ContentType "application/json"

Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/Socket" -Method Get -ContentType "application/json"

Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/Socket/Stop" -Method Get -ContentType "application/json"

