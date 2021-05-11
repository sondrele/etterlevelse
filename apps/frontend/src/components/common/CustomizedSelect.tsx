import { Select, SelectOverrides, SelectProps, StatefulSelect, StatefulSelectProps } from 'baseui/select'
import _ from 'lodash'
import { ettlevColors } from '../../util/theme'

const customOverrides: SelectOverrides = {
  ControlContainer: {
    style: {
      boxShadow: '0 2px 2px 0 rgba(0, 0, 0, .12), 0 2px 1px -1px rgba(0, 0, 0, .2)',
      ':hover': {
        backgroundColor: ettlevColors.green50,
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.12), 0px 1px 1px -1px rgba(0, 0, 0, 0.2)'
      }
    }
  }
}

export const CustomizedStatefulSelect = (props: StatefulSelectProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <StatefulSelect {...props} overrides={overrides}/>
}

export const CustomizedSelect = (props: SelectProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <Select {...props} overrides={overrides}/>
}
export default CustomizedSelect