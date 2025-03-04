// "use client"

// import { Suspense } from 'react'
// import Loading from './loading'
// import { useEffect, useState, useMemo, useRef } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { Card, CardContent } from "@/components/ui/card"
// import { PaginationControls } from "./components/pagination"
// import { Sidebar } from "./components/sidebar"
// import { ItemCard } from "./components/item-card"
// import { DateRangeSelector } from "./components/date-range-selector"
// import { LoadingSkeleton, LoadingCardsSkeleton, LoadingPaginationSkeleton } from "./components/loading-skeletons"
// import { useUrlState } from "./hooks/use-url-state"
// import { useFetchItems } from "./hooks/use-fetch-items"
// import { useDebounce } from "./hooks/use-debounce"
// import type { DateRange } from "react-day-picker"

// // Main component that uses search params
// function HomeContent() {
//   // Handler functions
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }

//   const handleFilterChange = (
//     types: string[],
//     phases: string[],
//     authors: string[],
//     dateRange: DateRange | undefined
//   ) => {
//     setFilters({ types, phases, authors, dateRange })
//     setCurrentPage(1) // Reset to page 1 when filters change
//   }

//   const clearAllFilters = () => {
//     setFilters({
//       types: [],
//       phases: [],
//       authors: [],
//       dateRange: undefined
//     })
//     setCurrentPage(1)
//     setSearchTerm("")
//   }

//   // Get initial state from URL parameters
//   const urlState = useUrlState()
//   const initialPage = urlState.getInitialPage()
//   const initialSearch = urlState.getInitialSearch()
//   const initialFilters = urlState.getInitialFilters()
//   const router = useRouter()

//   // State
//   const [currentPage, setCurrentPage] = useState(initialPage)
//   const [searchTerm, setSearchTerm] = useState(initialSearch)
//   const [filters, setFilters] = useState(initialFilters)
//   const [isFirstLoad, setIsFirstLoad] = useState(true)
  
//   // Apply debouncing to search to prevent excessive API calls
//   const debouncedSearch = useDebounce(searchTerm, 300)
  
//   // Fetch data
//   const { 
//     items, 
//     isLoading, 
//     error, 
//     totalPages, 
//     allTypes, 
//     allPhases, 
//     allAuthors, 
//     isMetadataLoading 
//   } = useFetchItems(currentPage, debouncedSearch, filters)
  
//   // Memoize whether there are active items to improve performance
//   const hasItems = useMemo(() => items.length > 0, [items])
  
//   // Update URL when state changes
//   useEffect(() => {
//     if (!isFirstLoad) {
//       urlState.updateUrl({
//         page: currentPage,
//         search: searchTerm,
//         filters: filters
//       })
//     }
//   }, [currentPage, searchTerm, filters, urlState, isFirstLoad])
  
//   // Update isFirstLoad after initial render
//   useEffect(() => {
//     if (isFirstLoad && !isLoading) {
//       setIsFirstLoad(false)
//     }
//   }, [isLoading, isFirstLoad])

//   // Check for returnTo parameter (when returning from details page)
//   useEffect(() => {
//     const returnPath = urlState.getReturnPath()
//     if (returnPath) {
//       try {
//         const returnUrl = new URL(window.location.origin + decodeURIComponent(returnPath))
//         const returnParams = new URLSearchParams(returnUrl.search)
        
//         // Restore previous state
//         const page = parseInt(returnParams.get('page') || '1')
//         setCurrentPage(page)
        
//         // Clear returnTo from URL
//         urlState.clearReturnTo()
//       } catch (e) {
//         console.error("Error parsing return URL:", e)
//       }
//     }
//   }, [urlState])

//   // Effect to watch for search term changes and reset pagination
//   const prevSearchRef = useRef(searchTerm)
//   useEffect(() => {
//     // Skip on initial load
//     if (!isFirstLoad && prevSearchRef.current !== searchTerm) {
//       // Search term changed, reset to page 1
//       setCurrentPage(1)
//     }
//     prevSearchRef.current = searchTerm
//   }, [searchTerm, isFirstLoad])

//   // Handle search form submission
//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Nothing needs to be done here as we're using the effect above
//     // to detect search changes and reset pagination
//   }

//   // Render main component
//   return (
//     <main className="container mx-auto px-4 py-6">
//       <div className="flex gap-4">
//         {/* Sidebar for larger screens */}
//         <div className="hidden md:block">
//         <Sidebar
//           isLoading={isMetadataLoading}
//           allTypes={allTypes}
//           selectedTypes={filters.types}
//           onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
//           allPhases={allPhases}
//           selectedPhases={filters.phases}
//           onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
//           allAuthors={allAuthors} 
//           selectedAuthors={filters.authors}
//           onAuthorsChange={(authors) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
//           date={filters.dateRange}
//           onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
//           onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
//           onClearAllFilters={clearAllFilters}
//           isMobile={false} 
//         />
//       </div>

//         {/* Main content area */}
//         <div className="flex-1 min-w-0">
//           {/* Search and filter controls */}
//           <div className="flex gap-4 mb-6">
//             {isMetadataLoading ? (
//               <LoadingSkeleton />
//             ) : (
//               <form onSubmit={handleSearchSubmit} className="flex-1">
//                 <Input
//                   type="search"
//                   placeholder="Pesquisar..."
//                   className="dark:bg-[#09090B] w-full"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   aria-label="Pesquisar iniciativas legislativas"
//                 />
//               </form>
//             )}

//             {/* Mobile filter sheet */}
//             <Sheet>
//               <SheetTrigger asChild className="md:hidden">
//                 <Button variant="outline" className="dark:bg-[#09090B]">
//                   Filtro
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-[280px] sm:w-[340px] dark:bg-[#09090B]">
//                 <div className="py-4">
//                   <Sidebar
//                     isLoading={isMetadataLoading}
//                     allTypes={allTypes}
//                     selectedTypes={filters.types}
//                     onTypesChange={(types) => handleFilterChange(types, filters.phases, filters.authors, filters.dateRange)}
//                     allPhases={allPhases}
//                     selectedPhases={filters.phases}
//                     onPhasesChange={(phases) => handleFilterChange(filters.types, phases, filters.authors, filters.dateRange)}
//                     allAuthors={allAuthors}
//                     selectedAuthors={filters.authors}
//                     onAuthorsChange={(authors) => handleFilterChange(filters.types, filters.phases, authors, filters.dateRange)}
//                     date={filters.dateRange}
//                     onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
//                     onClearDate={() => handleFilterChange(filters.types, filters.phases, filters.authors, undefined)}
//                     onClearAllFilters={clearAllFilters}
//                     isMobile={true}
//                   />
//                 </div>
//               </SheetContent>
//             </Sheet>
            
//             {/* Date range selector for desktop */}
//             {isMetadataLoading ? (
//               <LoadingSkeleton />
//             ) : (
//               <DateRangeSelector
//                 date={filters.dateRange}
//                 onDateChange={(dateRange) => handleFilterChange(filters.types, filters.phases, filters.authors, dateRange)}
//               />
//             )}
//           </div>
          
//           {/* Error message display */}
//           {error && (
//             <div className="bg-red-500 text-white p-4 rounded-md mb-6">
//               {error}
//             </div>
//           )}
          
//           {/* Items grid */}
//           <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
//             {isLoading ? (
//               <LoadingCardsSkeleton count={6} />
//             ) : !hasItems ? (
//               <Card className="flex justify-center col-span-full dark:bg-[#09090B] text-center">
//                 <CardContent className="py-8">
//                   <h3 className="text-lg text-[#94A3B8]">Nada Encontrado</h3>
//                   <p className="text-[#94A3B8] mt-2">Tente ajustar seus filtros ou termo de pesquisa</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               items.map((item) => (
//                 <ItemCard key={item.id} item={item} />
//               ))
//             )}
//           </div>

//           {/* Pagination */}
//           {isLoading ? (
//             <LoadingPaginationSkeleton />
//           ) : hasItems ? (
//             <div className="mt-8 flex justify-center">
//               <PaginationControls
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//               />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </main>
//   )
// }

// // Wrapper component with Suspense
// export default function Home() {
//   return (
//     <Suspense fallback={<Loading />}>
//       <HomeContent />
//     </Suspense>
//   )
// }


export default function MaintenancePage() {
  return (
    <html lang="pt">
      <head>
        <title>Em Manutenção | Passos Perdidos</title>
        <meta name="description" content="O site Passos Perdidos está em manutenção. Voltaremos em breve." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --background: #ffffff;
            --foreground: #0f172a;
            --primary: #2563eb;
            --muted: #f1f5f9;
            --muted-foreground: #64748b;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --background: #0f172a;
              --foreground: #f8fafc;
              --primary: #3b82f6;
              --muted: #1e293b;
              --muted-foreground: #94a3b8;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            line-height: 1.5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          
          .container {
            max-width: 800px;
            width: 100%;
            text-align: center;
          }
          
          .logo {
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
          
          .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }
          
          p {
            color: var(--muted-foreground);
            margin-bottom: 2rem;
            font-size: 1.125rem;
          }
          
          .illustration {
            margin: 2rem 0;
            max-width: 100%;
            height: auto;
          }
          
          .status {
            background-color: var(--muted);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 2rem;
            display: inline-block;
          }
          
          .status-text {
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          
          .pulse {
            display: inline-block;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            background-color: var(--primary);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              opacity: 1;
            }
            70% {
              transform: scale(1);
              opacity: 0.7;
            }
            100% {
              transform: scale(0.95);
              opacity: 1;
            }
          }
          
          .contact {
            margin-top: 2rem;
            font-size: 0.875rem;
            color: var(--muted-foreground);
          }
          
          .contact a {
            color: var(--primary);
            text-decoration: none;
          }
          
          .contact a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 640px) {
            h1 {
              font-size: 1.875rem;
            }
            
            p {
              font-size: 1rem;
            }
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="logo">
            <span className="logo-text">Passos Perdidos</span>
          </div>

          <h1>Site em Manutenção</h1>
          <p>
            Estamos a realizar melhorias no nosso sistema para lhe proporcionar uma melhor experiência.
            <br />
            Pedimos desculpa pelo incómodo e agradecemos a sua compreensão.
          </p>



        
          <div className="contact">
            Precisa de ajuda? Contacte-nos em <a href="mailto:geral@passosperdidos.pt">geral@passosperdidos.pt</a>
          </div>
        </div>
      </body>
    </html>
  )
}

