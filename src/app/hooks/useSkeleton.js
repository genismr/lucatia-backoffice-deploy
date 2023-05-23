import { useState, useCallback } from 'react'
import ContentSkeleton from '../modules/Skeleton/ContentSkeleton'

export const useSkeleton = () => {
	const [isLoading, setLoading] = useState(true)

	const disableLoading = useCallback(() => setTimeout(() => setLoading(false), 1000), [])


	return {
		isLoading,
		disableLoading,
		ContentSkeleton
	}
}