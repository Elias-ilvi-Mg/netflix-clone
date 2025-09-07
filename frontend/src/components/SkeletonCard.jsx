import styles from './SkeletonCard.module.css'

export default function SkeletonCard(){
return (
<div style={{
width: 180,
aspectRatio: '2/3',
borderRadius: 12,
background: 'linear-gradient(90deg,#1a1a1a 25%,#222 37%,#1a1a1a 63%)',
backgroundSize: '400% 100%',
animation: 'shimmer 1.2s infinite',
border: '1px solid #262626'
}}/>
)
}