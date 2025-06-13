# Forge Todo App

This project contains a Forge custom UI app written in React that displays in a Jira issue panel. 

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

![Todo app for Jira](./example.gif "Todo app for Jira")

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

### Register the app
- Register the app by running:
```
forge register
```

### Configure the environment
This app supports the following environment variables. It is recommended to set the variables in each environment
as you progress through your development process. Note that changing variables requires a redeploy.

See the [Forge documentation](https://developer.atlassian.com/platform/forge/environments-and-versions/#environment-variables) for more information on environment variables. 

See the [Forge CLI documentation](https://developer.atlassian.com/platform/forge/cli-reference/variables/) for more information on using variables.

#### `ANALYTICS_API_KEY`
Set the Accoil API key in the environment. This is available from your account in Accoil. For example in development:
```
forge variables set --environment development ANALYTICS_API_KEY <your_api_key>
```

#### `ANALYTICS_DEBUG`
Set this to `true` and no real calls will be made to Accoil, instead it will log lines like:
```
Running analytics in debug. The following payload would be sent to https://in.accoil.com/v1/users:
{"user_id":"xxxx","group_id":"xxxx","traits":{"name":"xxxx"},"api_key":"xxxx","timestamp":1749789914400}
```

Set or unset with
```
forge variables set --environment development ANALYTICS_DEBUG true
forge variables unset --environment development ANALYTICS_DEBUG
```

#### `ANALTYICS_USER_ID_OVERRIDE`
Set this to `true` to always send the group ID in place of user IDs.

Set or unset with
```
forge variables set --environment development ANALTYICS_USER_ID_OVERRIDE true
forge variables unset --environment development ANALTYICS_USER_ID_OVERRIDE
```

### Frontend
- Change into the frontend directory by running:
```
cd ./static/spa
```

- Install your frontend dependencies by running:
```
npm install
```

- Build your frontend by running:
```
npm run build
```

### Deployment
For this section, ensure you have navigated back to the root of the repository.

- Install the forge dependencies by running:
```
npm install
```

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

## Support
See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

## Contributions
Contributions are welcome! Please see CONTRIBUTING.md for details.

## License
Copyright (c) 2020 Atlassian and others. Apache 2.0 licensed, see LICENSE file.
