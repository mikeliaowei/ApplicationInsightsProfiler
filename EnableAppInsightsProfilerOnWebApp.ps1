#Requires -Version 3.0

<#
.DESCRIPTION
    Enable Application Insights Profiler on Azure Web App, including 
        a. Install Application Insights Profiler Web App Extension
        b. Add APPINSIGHTS_INSTRUMENTATIONKEY App Setting
        c. Set .Net Framework to v4.6
        d. Enable Always-On

.EXAMPLE
    ./EnableAppInsightsProfiler.ps -subscriptionId "e940815b-f343-40b1-819e-418c48c67ea" -resourceGroup "myresroucegroup" -appName "myapp" -instrumentationKey "89ac00c7-85c3-4391-b803-095bd2a2d4a6"

    ./EnableAppInsightsProfiler.ps -subscriptionId "e940815b-f343-40b1-819e-418c48c67ea" -resourceGroup "myresroucegroup" -appName "myapp" -slotName "staging"  -instrumentationKey "89ac00c7-85c3-4391-b803-095bd2a2d4a6"

#>

[CmdletBinding()]
Param(
    [Parameter(Mandatory=$True)]
    [string]$subscriptionId,

    [Parameter(Mandatory=$True)]
    [string]$resourceGroup,

    [Parameter(Mandatory=$True)]
    [string]$appName,

    [Parameter(Mandatory=$false)]
    [string]$slotName = "production",

    [Parameter(Mandatory=$True)]
    [string]$instrumentationKey
)

Login-AzureRmAccount -SubscriptionId $subscriptionId

# Enable Application Insigths Profiler WebApp Extension

$apiVersion = "2016-08-01"
$properties = @{}
if($slotName -eq "production")
{
    $resourceName = "$appName/Microsoft.ApplicationInsights.AzureWebSites"
    $resourceType = "Microsoft.Web/sites/siteextensions"
}
else 
{
    $resourceName = "$appName/$slotName/Microsoft.ApplicationInsights.AzureWebSites"
    $resourceType = "Microsoft.Web/sites/slots/siteextensions"
}

New-AzureRmResource -ResourceGroupName $resourceGroup -ResourceName $resourceName -ResourceType $resourceType -Properties $properties -ApiVersion $apiVersion -Verbose -Force -ErrorAction Stop

# Add APPINSIGHTS_INSTRUMENTATIONKEY setting, update dotnet framework

$netFrameworkVersion = "v4.0"
$app = Get-AzureRmWebAppSlot -ResourceGroupName $resourceGroup -Name $appName -Slot $slotName
$settings = @{}
$app.SiteConfig.AppSettings | % { $settings[$_.Name] = $_.Value }
$settings["APPINSIGHTS_INSTRUMENTATIONKEY"] = $instrumentationKey

Set-AzureRmWebAppSlot -ResourceGroupName $resourceGroup -Name $appName -Slot $slotName -AppSettings $settings -NetFrameworkVersion $netFrameworkVersion -Verbose -ErrorAction Stop


# Enable always-on

if($slotName -eq "production")
{
    $resourceName = $appName
    $resourceType = "Microsoft.Web/sites"
}
else 
{
    $resourceName = "$appName/$slotName"
    $resourceType = "Microsoft.Web/sites/slots"
}

Set-AzureRmResource -ResourceGroupName $resourceGroup -ResourceType $resourceType -Name $resourceName -PropertyObject @{ "siteconfig" = @{ "alwayson" = $true } } -ApiVersion $apiVersion -Verbose -Force -ErrorAction Stop
