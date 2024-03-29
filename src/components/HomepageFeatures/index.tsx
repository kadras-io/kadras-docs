import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Engineering Platform',
    Svg: require('@site/static/img/undraw_lost_online_re_upmy.svg').default,
    description: (
      <>
        Kadras provides an <a href="https://github.com/kadras-io/engineering-platform">engineering platform</a> you can use as a foundation
        to implement your own cloud native internal platforms.
      </>
    ),
  },
  {
    title: 'Application Catalog',
    Svg: require('@site/static/img/undraw_drone_delivery_re_in95.svg').default,
    description: (
      <>
        Kadras offers a <a href="https://github.com/kadras-io/kadras-packages">curated catalog</a> of all the essential components to build
        cloud native platforms relying on Carvel package management.
      </>
    ),
  },
  {
    title: 'Toolkit',
    Svg: require('@site/static/img/undraw_engineering_team_a7n2.svg').default,
    description: (
      <>
        Kadras aims at researching <a href="https://github.com/kadras-io">cloud native projects</a> and providing a toolkit
        of building blocks useful for several platform engineering scenarios.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
