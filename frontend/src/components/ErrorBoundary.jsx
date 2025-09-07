import { Component } from 'react'


export default class ErrorBoundary extends Component {
constructor(props){ super(props); this.state = { hasError: false } }
static getDerivedStateFromError(){ return { hasError: true } }
componentDidCatch(err, info){ console.error('ErrorBoundary', err, info) }
render(){
if (this.state.hasError) return (
<main className="container" style={{ padding: '48px 0' }}>
<h1>Something went wrong</h1>
<p>Try refreshing the page.</p>
</main>
)
return this.props.children
}
}