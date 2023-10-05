import { Link } from '@navikt/ds-react'

const SkipToContent = () => {

  return (
    <>
        <Link className="p-2 absolute -top-10 left-0 focus:top-0" href="#content">Hovedinnhold</Link>
        <Link className="p-2 absolute -top-10 left-0 focus:top-0" href="#search">Søk</Link>
    </>
  )
}

export default SkipToContent
