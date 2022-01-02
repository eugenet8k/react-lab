import 'core-js/stable'
import {createRoot} from 'react-dom'
import {Global, css} from '@emotion/react'
import Application from './app/application'

createRoot(global.document.body).render(
  <>
    <Global
      styles={css(import('modern-normalize/modern-normalize.css').toString())}
    />
    <Application />
  </>
)
