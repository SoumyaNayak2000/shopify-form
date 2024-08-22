import { Layout, LegacyCard } from '@shopify/polaris';
import React from 'react';

export function Card({ title, count }) {
  return (
    <Layout.Section oneHalf>
      <LegacyCard title={title} sectioned>
        <h1 className='total_count'>{count}</h1>
      </LegacyCard>
    </Layout.Section>
  );
}
