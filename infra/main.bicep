targetScope = 'resourceGroup'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Name of the application')
param appName string = 'agent-governance-dashboard'

@description('Environment name')
param environmentName string = 'dev'

@description('Azure OpenAI endpoint')
param openAiEndpoint string = ''

@description('Azure OpenAI API key')
@secure()
param openAiApiKey string = ''

@description('Azure OpenAI deployment name')
param openAiDeploymentName string = 'gpt-35-turbo'

// Generate unique resource names
var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, location))
var staticWebAppName = '${appName}-${environmentName}-${resourceToken}'

// Static Web App for hosting
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      apiLocation: 'api'
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
      apiBuildCommand: 'npm run build:functions'
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    provider: 'GitHub'
    enterpriseGradeCdnStatus: 'Disabled'
  }
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'web'
  }
}

// App Settings for the Static Web App
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    AZURE_OPENAI_ENDPOINT: openAiEndpoint
    AZURE_OPENAI_API_KEY: openAiApiKey
    AZURE_OPENAI_DEPLOYMENT_NAME: openAiDeploymentName
  }
}

// Outputs
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output staticWebAppName string = staticWebApp.name
output resourceGroupName string = resourceGroup().name
