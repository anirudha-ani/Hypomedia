const devEndpoint = 'http://localhost:5001/' // change this to 5000 if needed

// TODO [Deployment]: change this to your heroku app url
const prodEndpoint = 'https://infinite-hollows-73607.herokuapp.com/'

export const endpoint = process.env.NODE_ENV === 'production' ? prodEndpoint : devEndpoint
