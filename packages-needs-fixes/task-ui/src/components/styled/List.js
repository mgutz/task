import * as React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export const UnorderedList = styled.ul`
  list-style: none;
`

export class FlatList extends React.PureComponent {
  static propTypes = {
    data: PropTypes.array,
    renderItem: PropTypes.func,
    keyExtractor: PropTypes.func,
  }

  render() {
    const {data, renderItem, keyExtractor} = this.props
    if (!data) return null

    const items = data.map((item, i) => {
      const key = keyExtractor ? keyExtractor(item, i) : i
      return <li key={key}>{renderItem({item})}</li>
    })

    return <UnorderedList>{items}</UnorderedList>
  }
}
