import React from 'react';

// Skeleton animado básico
const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} />
);

// Skeleton para tarjeta de proyecto
export const ProjectCardSkeleton = () => (
  <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50">
    <Skeleton height="h-6" className="mb-4 w-3/4" />
    <Skeleton height="h-4" className="mb-2 w-1/2" />
    <Skeleton height="h-4" className="mb-6 w-full" />

    <div className="space-y-4 mb-8">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton width="w-1/3" />
          <Skeleton width="w-1/4" />
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <Skeleton height="h-12" className="flex-1" />
      <Skeleton height="h-12" className="flex-1" />
    </div>
  </div>
);

// Skeleton para tarjeta de cotización
export const QuotationCardSkeleton = () => (
  <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50">
    <div className="flex justify-between items-start mb-4">
      <Skeleton height="h-6" width="w-2/3" />
      <Skeleton height="h-6" width="w-20" className="rounded-full" />
    </div>

    <div className="space-y-3 mb-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton width="w-1/3" />
          <Skeleton width="w-1/4" />
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <Skeleton height="h-10" className="flex-1" />
      <Skeleton height="h-10" className="flex-1" />
    </div>
  </div>
);

// Skeleton para tarjeta de contrato
export const ContractCardSkeleton = () => (
  <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50">
    <div className="flex justify-between items-start mb-4">
      <Skeleton height="h-6" width="w-2/3" />
      <Skeleton height="h-6" width="w-24" className="rounded-full" />
    </div>

    <div className="space-y-3 mb-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton width="w-2/5" />
          <Skeleton width="w-1/3" />
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <Skeleton height="h-10" className="flex-1" />
      <Skeleton height="h-10" className="flex-1" />
    </div>
  </div>
);

// Skeleton para tarjeta de reseña
export const ReviewCardSkeleton = () => (
  <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <Skeleton height="h-6" width="w-1/2" className="mb-2" />
        <Skeleton height="h-4" width="w-3/4" />
      </div>
      <Skeleton height="h-8" width="w-16" />
    </div>

    <div className="space-y-2 mb-4">
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-5/6" />
      <Skeleton height="h-4" width="w-4/6" />
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton height="h-8" className="mb-2" />
          <Skeleton height="h-3" />
        </div>
      ))}
    </div>

    <Skeleton height="h-20" className="rounded-xl" />
  </div>
);

// Grid de skeletons
export const SkeletonGrid = ({ type = 'project', count = 6, columns = 3 }) => {
  const SkeletonComponent = {
    project: ProjectCardSkeleton,
    quotation: QuotationCardSkeleton,
    contract: ContractCardSkeleton,
    review: ReviewCardSkeleton,
  }[type] || ProjectCardSkeleton;

  const gridClass = {
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
  }[columns] || 'grid-cols-1 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-10`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
