$questions = @(
    "How many sick days do I get?",
    "How many total leave days per year?",
    "Can I work from home whenever I want?",
    "What if I need WFH for a family reason?",
    "Do I get travel reimbursement for personal trips?",
    "Are company-related travel costs covered?",
    "What happens to my insurance if I leave the company?",
    "When is health insurance signed up for?",
    "How much notice do I need to give before resigning?",
    "Can I resign after 2 months of joining?",
    "What is the office WiFi password?",
    "Can I get a company laptop?",
    "What is the dress code policy?",
    "How do I book a conference room?",
    "What's the parking policy?"
)

foreach ($q in $questions) {
    Write-Host "Q: $q"
    $result = Invoke-RestMethod -Uri "http://localhost:5678/webhook/hr-question" -Method Post -ContentType "application/json" -Body (@{question=$q} | ConvertTo-Json)
    Write-Host "A: $($result.answer)"
    Write-Host "---"
    Start-Sleep -Seconds 2
}